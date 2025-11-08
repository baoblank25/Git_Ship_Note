"""
Test script for GitScribe API
==============================
Run this while app.py is running in another terminal

This script tests all the main endpoints of your GitScribe backend.
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def print_subheader(text):
    """Print a formatted subheader"""
    print(f"\n🧪 {text}")
    print("-" * 70)

def test_health():
    """Test if server is running"""
    print_subheader("Testing Health Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Health check passed!")
            return True
        else:
            print("❌ Health check failed!")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_generate_from_text():
    """Test generating release notes from pasted git log text"""
    print_subheader("Testing Generate From Text Endpoint (Main Demo)")
    
    # This is what a user would paste into your website
    sample_git_log = """a83b1c9 fix(auth): resolve password reset token bug
b1d4e2a feat(ui): add new dark mode toggle
c3f5g6h chore: update README.md
d4e7h8j feat(profile): users can now upload avatars
e5f9i0k perf(db): add index to users table for faster queries
f6g1j2l docs: update api contribution guide
g7h3k4m fix(css): header alignment issue on mobile
h8i4l5n feat(notifications): add email notifications for new messages
i9j5m6o fix(api): handle null values in user profile endpoint"""

    payload = {
        "git_log_text": sample_git_log
    }
    
    print(f"Sending {len(sample_git_log.split(chr(10)))} commits to API...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-from-text",
            json=payload,
            timeout=30  # Give Claude time to respond
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Success! Generated notes for {data.get('commit_count')} commits")
                print("\n" + "📝 GENERATED RELEASE NOTES ".center(70, "="))
                print(data.get('notes'))
                print("="*70)
                return True
            else:
                print(f"❌ API returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out. Claude API might be slow.")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_generate_notes_structured():
    """Test generating notes with structured commit data"""
    print_subheader("Testing Generate Notes Endpoint (Structured Data)")
    
    # This is what the CLI tool would send
    commits = [
        {
            "hash": "a83b1c9",
            "message": "fix(auth): resolve password reset token bug",
            "author": "John Doe",
            "date": "2024-11-08T10:30:00"
        },
        {
            "hash": "b1d4e2a",
            "message": "feat(ui): add new dark mode toggle",
            "author": "Jane Smith",
            "date": "2024-11-08T11:00:00"
        },
        {
            "hash": "d4e7h8j",
            "message": "feat(profile): users can now upload avatars",
            "author": "Bob Wilson",
            "date": "2024-11-08T12:00:00"
        },
        {
            "hash": "g7h3k4m",
            "message": "fix(css): header alignment issue on mobile",
            "author": "Alice Johnson",
            "date": "2024-11-08T13:00:00"
        }
    ]
    
    payload = {
        "commits": commits,
        "from": "v1.0.0",
        "to": "HEAD"
    }
    
    print(f"Sending {len(commits)} structured commits...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-notes",
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Success! Processed {data.get('commit_count')} commits")
                print("\n" + "📝 GENERATED RELEASE NOTES ".center(70, "="))
                print(data.get('notes'))
                print("="*70)
                return True
            else:
                print(f"❌ Error: {data.get('error')}")
                return False
        else:
            print(f"❌ Request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_error_handling():
    """Test error handling with invalid input"""
    print_subheader("Testing Error Handling")
    
    # Test with empty git log
    print("\n1. Testing with empty git log...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-from-text",
            json={"git_log_text": ""},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Correctly rejected empty input")
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test with no commits
    print("\n2. Testing with missing commits...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-notes",
            json={"commits": []},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Correctly rejected empty commits")
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    """Run all tests"""
    print_header("🚀 GitScribe API Test Suite")
    print("\n📋 Make sure the following is running:")
    print("   Terminal 1: python app.py")
    print("   API URL: http://localhost:5000")
    
    input("\n👉 Press Enter to start testing...")
    
    results = {
        "passed": 0,
        "failed": 0
    }
    
    try:
        # Test 1: Health Check
        print_header("Test 1: Health Check")
        if test_health():
            results["passed"] += 1
        else:
            results["failed"] += 1
            print("\n⚠️  Server is not responding. Make sure 'python app.py' is running!")
            return
        
        # Test 2: Generate from Text (Main feature)
        print_header("Test 2: Generate From Text (Website Demo)")
        if test_generate_from_text():
            results["passed"] += 1
        else:
            results["failed"] += 1
        
        # Test 3: Generate with Structured Data
        print_header("Test 3: Generate Notes (CLI/Structured)")
        if test_generate_notes_structured():
            results["passed"] += 1
        else:
            results["failed"] += 1
        
        # Test 4: Error Handling
        print_header("Test 4: Error Handling")
        test_error_handling()
        
        # Summary
        print_header("📊 Test Summary")
        print(f"\n✅ Passed: {results['passed']}")
        print(f"❌ Failed: {results['failed']}")
        print(f"📈 Total: {results['passed'] + results['failed']}")
        
        if results['failed'] == 0:
            print("\n🎉 All tests passed! Your backend is working perfectly!")
        else:
            print("\n⚠️  Some tests failed. Check the errors above.")
        
    except requests.exceptions.ConnectionError:
        print("\n" + "="*70)
        print("❌ CONNECTION ERROR")
        print("="*70)
        print("\nCannot connect to http://localhost:5000")
        print("\n📝 Make sure you have:")
        print("   1. Started the backend: cd backend && python app.py")
        print("   2. The server is running on port 5000")
        print("   3. No firewall is blocking the connection")
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()
