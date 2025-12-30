import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для модераторов: просмотр всех релизов, принятие и отклонение с указанием причины"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Moderator-Id'
            },
            'body': ''
        }
    
    try:
        moderator_id = event.get('headers', {}).get('X-Moderator-Id') or event.get('headers', {}).get('x-moderator-id')
        
        if not moderator_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Moderator ID required'})
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            status_filter = params.get('status', 'pending')
            
            cursor.execute('''
                SELECT r.*, 
                       json_agg(
                           json_build_object(
                               'id', t.id,
                               'title', t.title,
                               'audio_url', t.audio_url,
                               'tiktok_moment', t.tiktok_moment,
                               'music_author', t.music_author,
                               'lyrics_author', t.lyrics_author,
                               'has_explicit', t.has_explicit,
                               'performers', t.performers,
                               'producers', t.producers,
                               'isrc', t.isrc,
                               'language', t.language,
                               'track_order', t.track_order,
                               'lyrics', t.lyrics,
                               'is_instrumental', t.is_instrumental
                           ) ORDER BY t.track_order
                       ) FILTER (WHERE t.id IS NOT NULL) as tracks
                FROM t_p4903350_kedoo_music_distribu.releases r
                LEFT JOIN t_p4903350_kedoo_music_distribu.tracks t ON r.id = t.release_id
                WHERE r.status = %s AND r.trash_status IS NULL
                GROUP BY r.id
                ORDER BY r.created_at DESC
            ''', (status_filter,))
            
            releases = cursor.fetchall()
            conn.close()
            
            releases_list = []
            for release in releases:
                release_dict = dict(release)
                if release_dict['created_at']:
                    release_dict['created_at'] = release_dict['created_at'].isoformat()
                if release_dict['updated_at']:
                    release_dict['updated_at'] = release_dict['updated_at'].isoformat()
                if release_dict.get('old_release_date'):
                    release_dict['old_release_date'] = release_dict['old_release_date'].isoformat()
                if release_dict.get('new_release_date'):
                    release_dict['new_release_date'] = release_dict['new_release_date'].isoformat()
                releases_list.append(release_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'releases': releases_list})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            release_id = body.get('release_id')
            
            if action == 'approve':
                cursor.execute('''
                    UPDATE t_p4903350_kedoo_music_distribu.releases 
                    SET status = 'approved', rejection_reason = NULL, updated_at = NOW()
                    WHERE id = %s
                ''', (release_id,))
                
                conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Release approved'})
                }
            
            elif action == 'reject':
                rejection_reason = body.get('rejection_reason', '')
                
                if not rejection_reason:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Rejection reason is required'})
                    }
                
                cursor.execute('''
                    UPDATE t_p4903350_kedoo_music_distribu.releases 
                    SET status = 'rejected', rejection_reason = %s, updated_at = NOW()
                    WHERE id = %s
                ''', (rejection_reason, release_id))
                
                conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Release rejected'})
                }
        
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
