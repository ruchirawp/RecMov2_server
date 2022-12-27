export const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        // console.log("TOKEN:", request.get('authorization'))
      return authorization.substring(7)
    }
    return null
  }