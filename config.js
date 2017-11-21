module.exports = exports = {
  quarters: {
    key: process.env.QUARTERS_KEY || '4ELvnPuxeEWZYw3Fgins',
    secret:
      process.env.QUARTERS_SECRET ||
      'jkejdyxrttcg2y3ok4kqcivc3g5daamguct0ve5pdre6xaur05jium',
    webSecret:
      process.env.QUARTERS_WEBSECRET || '3luv5t2fkyh5oyfjalhp8u814pyua4dck',
    address:
      process.env.QUARTERS_ADDRESS ||
      '0x347b0bfc4a86b1402c9dd92fea727235e92888c0',
    quartersURL:
      process.env.QUARTERS_URL || 'https://dev.pocketfulofquarters.com',
    apiURL:
      process.env.QUARTERS_API_URL ||
      'https://api.dev.pocketfulofquarters.com/v1/'
  }
}