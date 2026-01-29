// api/save-to-notion.js
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, databaseId, book } = req.body;

    if (!token || !databaseId || !book) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 노션 API 호출
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId
        },
        properties: {
          '책': {
            title: [
              {
                text: {
                  content: book.title
                }
              }
            ]
          },
          '창작자': {
            rich_text: [
              {
                text: {
                  content: book.author || ''
                }
              }
            ]
          },
          '구분': {
            select: {
              name: '책'
            }
          },
          '시작일': {
            date: {
              start: new Date().toISOString().split('T')[0]
            }
          },
          '현황': {
            status: {
              name: '감상 중'
            }
          },
          '이미지': {
            files: [
              {
                type: 'external',
                name: 'cover',
                external: {
                  url: book.cover || ''
                }
              }
            ]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.message || 'Notion API error' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
