// Simple password protection middleware
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    const sitePassword = process.env.SITE_PASSWORD || 'DJNuffJamz2025!';
    
    if (password === sitePassword) {
      // Set a session cookie
      res.setHeader('Set-Cookie', [
        `authenticated=true; Max-Age=${60 * 60 * 24 * 7}; Path=/; HttpOnly; Secure; SameSite=Strict`
      ]);
      
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}
