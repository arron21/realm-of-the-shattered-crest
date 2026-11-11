module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    game: 'Realm of the Shattered Crest',
    mode: 'vercel-serverless',
    onlinePlayers: 12
  });
};
