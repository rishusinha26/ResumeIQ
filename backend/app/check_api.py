import requests

base = 'http://127.0.0.1:8000/api/v1'
paths = ['/dsa/companies', '/dsa/questions', '/aptitude/questions?topic=verbal&difficulty=medium']
for path in paths:
    try:
        r = requests.get(base + path, timeout=10)
        print(path, r.status_code, r.headers.get('content-type'))
        print(r.text[:500])
    except Exception as e:
        print(path, 'ERROR', e)
