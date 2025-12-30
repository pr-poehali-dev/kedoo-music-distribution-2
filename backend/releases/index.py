import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для управления релизами пользователя: создание, получение, обновление, удаление и восстановление"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': ''
        }
    
    try:
        user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User ID required'})
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            show_trash = params.get('trash') == 'true'
            
            if show_trash:
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
                    WHERE r.user_id = %s AND r.trash_status IS NOT NULL
                    GROUP BY r.id
                    ORDER BY r.trash_status DESC
                ''', (int(user_id),))
            else:
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
                    WHERE r.user_id = %s AND r.trash_status IS NULL
                    GROUP BY r.id
                    ORDER BY r.created_at DESC
                ''', (int(user_id),))
            
            releases = cursor.fetchall()
            conn.close()
            
            releases_list = []
            for release in releases:
                release_dict = dict(release)
                if release_dict['created_at']:
                    release_dict['created_at'] = release_dict['created_at'].isoformat()
                if release_dict['updated_at']:
                    release_dict['updated_at'] = release_dict['updated_at'].isoformat()
                if release_dict.get('trash_status'):
                    release_dict['trash_status'] = release_dict['trash_status'].isoformat()
                if release_dict.get('old_release_date'):
                    release_dict['old_release_date'] = release_dict['old_release_date'].isoformat()
                if release_dict.get('new_release_date'):
                    release_dict['new_release_date'] = release_dict['new_release_date'].isoformat()
                if release_dict.get('rejection_reason') is None:
                    release_dict['rejection_reason'] = ''
                releases_list.append(release_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'releases': releases_list})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'restore':
                release_id = body.get('release_id')
                cursor.execute('''
                    UPDATE t_p4903350_kedoo_music_distribu.releases 
                    SET trash_status = NULL, updated_at = NOW()
                    WHERE id = %s AND user_id = %s
                ''', (release_id, int(user_id)))
                conn.commit()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Release restored'})
                }
            
            cursor.execute('''
                INSERT INTO t_p4903350_kedoo_music_distribu.releases 
                (user_id, title, upc, genre, cover_url, old_release_date, new_release_date, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            ''', (
                int(user_id),
                body.get('title'),
                body.get('upc'),
                body.get('genre'),
                body.get('cover_url'),
                body.get('old_release_date'),
                body.get('new_release_date'),
                body.get('status', 'draft')
            ))
            
            release_id = cursor.fetchone()['id']
            
            if body.get('tracks'):
                for idx, track in enumerate(body['tracks']):
                    cursor.execute('''
                        INSERT INTO t_p4903350_kedoo_music_distribu.tracks 
                        (release_id, title, audio_url, tiktok_moment, music_author, lyrics_author, 
                         has_explicit, performers, producers, isrc, language, track_order, lyrics, is_instrumental, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ''', (
                        release_id,
                        track.get('title'),
                        track.get('audio_url'),
                        track.get('tiktok_moment'),
                        track.get('music_author'),
                        track.get('lyrics_author'),
                        track.get('has_explicit', False),
                        track.get('performers'),
                        track.get('producers'),
                        track.get('isrc'),
                        track.get('language'),
                        idx + 1,
                        track.get('lyrics'),
                        track.get('is_instrumental', False)
                    ))
            
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'release_id': release_id})
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            release_id = body.get('id')
            
            cursor.execute('''
                UPDATE t_p4903350_kedoo_music_distribu.releases 
                SET title = %s, upc = %s, genre = %s, cover_url = %s, 
                    old_release_date = %s, new_release_date = %s, status = %s, 
                    rejection_reason = %s, updated_at = NOW()
                WHERE id = %s AND user_id = %s
            ''', (
                body.get('title'),
                body.get('upc'),
                body.get('genre'),
                body.get('cover_url'),
                body.get('old_release_date'),
                body.get('new_release_date'),
                body.get('status'),
                body.get('rejection_reason'),
                release_id,
                int(user_id)
            ))
            
            cursor.execute('DELETE FROM t_p4903350_kedoo_music_distribu.tracks WHERE release_id = %s', (release_id,))
            
            if body.get('tracks'):
                for idx, track in enumerate(body['tracks']):
                    cursor.execute('''
                        INSERT INTO t_p4903350_kedoo_music_distribu.tracks 
                        (release_id, title, audio_url, tiktok_moment, music_author, lyrics_author, 
                         has_explicit, performers, producers, isrc, language, track_order, lyrics, is_instrumental, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                    ''', (
                        release_id,
                        track.get('title'),
                        track.get('audio_url'),
                        track.get('tiktok_moment'),
                        track.get('music_author'),
                        track.get('lyrics_author'),
                        track.get('has_explicit', False),
                        track.get('performers'),
                        track.get('producers'),
                        track.get('isrc'),
                        track.get('language'),
                        idx + 1,
                        track.get('lyrics'),
                        track.get('is_instrumental', False)
                    ))
            
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            release_id = params.get('id')
            permanent = params.get('permanent') == 'true'
            
            if permanent:
                cursor.execute('DELETE FROM t_p4903350_kedoo_music_distribu.tracks WHERE release_id = %s', (release_id,))
                cursor.execute('DELETE FROM t_p4903350_kedoo_music_distribu.releases WHERE id = %s AND user_id = %s', (release_id, int(user_id)))
            else:
                cursor.execute('''
                    UPDATE t_p4903350_kedoo_music_distribu.releases 
                    SET trash_status = NOW(), updated_at = NOW()
                    WHERE id = %s AND user_id = %s
                ''', (release_id, int(user_id)))
            
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
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