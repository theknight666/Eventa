with open('backend/server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if '@api_router.get("/events")' in line:
            print(''.join(lines[i:i+30]))
            break
