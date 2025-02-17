from googleapiclient.discovery import build

# Your API key
API_KEY = 'AIzaSyADTz9nJHXYmYzM4fA8jiveU-hqFy1PIRQ'

def test_youtube_api():
    try:
        # Create YouTube API client
        youtube = build('youtube', 'v3', developerKey=API_KEY)
        
        # Make a simple search request
        request = youtube.search().list(
            part='snippet',
            maxResults=5,
            q='python programming',
            type='video'
        )
        
        # Execute the request
        response = request.execute()
        
        # Print the results
        print("API Response:")
        print("=============")
        for item in response['items']:
            print(f"\nTitle: {item['snippet']['title']}")
            print(f"Channel: {item['snippet']['channelTitle']}")
            print(f"Description: {item['snippet']['description'][:100]}...")
            print("-" * 80)
            
        print("\nAPI call successful!")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    if not API_KEY:
        print("Error: YOUTUBE_API_KEY environment variable not set")
    else:
        test_youtube_api()
