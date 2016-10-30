// Description:
//   Uses home lighting API to check for control the lights
//
// Commands:
//   lizbot <위치> (조명|불|등)(켜|꺼) - <위치>의 조명을 조작합니다
//

const URI = process.env.LIGHT_API_URI || 'http://localhost:5000'

const alias = {
  '거실': 'living',
  '침실': 'bed'
}

const actions = {
  '켜': 'on',
  '꺼': 'off',
  '끄': 'off'
}

module.exports = function (robot) {
  robot.hear(/(.*) (조명|불|등)(.*)(켜|꺼|끄)/i, (res) => {
    console.log(res.match)
    const key = res.match[1]
    const target = res.match[2]
    const action = res.match[4]
    const location = alias[key] || key
    const status = actions[action] || action

    res.http(`${URI}/op/${location}`)
      .post({ status })((err, response, body) => {
        if(!body || err) {
          return res.send('동작에 문제가 있습니다.')
        }

        let result = JSON.parse(body)
        if(result.okay) {
          res.send(`${key} ${target}이 ${action}졌습니다.`)
        }
      })
  })
}
