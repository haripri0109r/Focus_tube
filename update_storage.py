import requests
import websocket
import json

def get_options_ws_url():
    resp = requests.get('http://127.0.0.1:9222/json')
    targets = resp.json()
    for target in targets:
        if 'options.html' in target.get('url', ''):
            return target['webSocketDebuggerUrl']
    for target in targets:
        if target.get('type') == 'page' and 'webSocketDebuggerUrl' in target:
            return target['webSocketDebuggerUrl']
    raise Exception("No suitable target found. Open options page or YouTube first!")

def run_js(ws_url, expr):
    ws = websocket.create_connection(ws_url, suppress_origin=True)
    msg = {
        "id": 1,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expr,
            "awaitPromise": True,
            "returnByValue": True
        }
    }
    ws.send(json.dumps(msg))
    resp = ws.recv()
    ws.close()
    return json.loads(resp)

try:
    ws_url = get_options_ws_url()
    # Configure prefs: Always-On active, AI/ML selected, but empty defaultKeywords
    expr = """
    chrome.storage.local.set({
      focustube_prefs: {
        alwaysOn: true,
        careerPath: 'AI/ML',
        defaultKeywords: [],
        defaultTopic: '',
        filterHome: true,
        filterSearch: true,
        filterShorts: true,
        filterSidebar: true
      }
    }).then(() => 'Prefs updated successfully')
    """
    res = run_js(ws_url, expr)
    print("Update Result:", res.get('result', {}).get('result', {}).get('value', 'No value'))
except Exception as e:
    print("Error:", e)
