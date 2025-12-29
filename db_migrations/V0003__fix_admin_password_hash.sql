UPDATE users 
SET password = encode(sha256('zzzz-2014'::bytea), 'hex')
WHERE email = 'moder@olprod.ru' AND password = 'zzzz-2014';