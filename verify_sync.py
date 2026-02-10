
import requests
import json
import datetime

API_URL = "http://127.0.0.1:8000/api/v1/sync"
TOKEN = "test_token_12345"

payload = {
    "events": [
        {
            "timestamp": datetime.datetime.now().isoformat(),
            "count": 5,
            "type": "boarding",
            "location": {
                "lat": 10.123,
                "lon": -68.123
            }
        },
        {
            "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=1)).isoformat(),
            "count": 2,
            "type": "alighting",
             "location": {
                "lat": 10.124,
                "lon": -68.124
            }
        }
    ]
}

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

try:
    print(f"Sending request to {API_URL}...")
    response = requests.post(API_URL, json=payload, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Sync Test PASSED")
    else:
        print("❌ Sync Test FAILED")

except Exception as e:
    print(f"❌ Error: {e}")
