// Health check API endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    platform: 'CSI Club Operations Platform',
    timestamp: new Date().toISOString()
  });
}
