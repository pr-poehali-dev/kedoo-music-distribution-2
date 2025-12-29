import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """API для управления тикетами поддержки: создание, получение списка и ответы от администратора"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            cursor.execute('''
                SELECT * FROM t_p4903350_kedoo_music_distribu.tickets
                WHERE user_id = %s
                ORDER BY created_at DESC
            ''', (int(user_id),))
            
            tickets = cursor.fetchall()
            conn.close()
            
            tickets_list = []
            for ticket in tickets:
                ticket_dict = dict(ticket)
                if ticket_dict['created_at']:
                    ticket_dict['created_at'] = ticket_dict['created_at'].isoformat()
                if ticket_dict['updated_at']:
                    ticket_dict['updated_at'] = ticket_dict['updated_at'].isoformat()
                tickets_list.append(ticket_dict)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tickets': tickets_list})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO t_p4903350_kedoo_music_distribu.tickets 
                (user_id, subject, message, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            ''', (
                int(user_id),
                body.get('subject'),
                body.get('message'),
                'open'
            ))
            
            ticket_id = cursor.fetchone()['id']
            conn.commit()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'ticket_id': ticket_id})
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            ticket_id = body.get('id')
            
            cursor.execute('''
                UPDATE t_p4903350_kedoo_music_distribu.tickets 
                SET status = %s, admin_response = %s, updated_at = NOW()
                WHERE id = %s AND user_id = %s
            ''', (
                body.get('status'),
                body.get('admin_response'),
                ticket_id,
                int(user_id)
            ))
            
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
