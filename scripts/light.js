// Description:
//   Uses home lighting API to check for control the lights
//
// Commands:
//   lizbot <위치> (조명|불|등)(켜|꺼) - <위치>의 조명을 조작합니다
//

const request = require('request')

const URI = process.env.LIGHT_API_URI || 'http://localhost:5000'
const DURATION = 20

const alias = {
  '거실': 'living',
  '침실': 'bed'
}

const actions = {
  '켜': 'on',
  '꺼': 'off',
  '끄': 'off'
}

function operate(res, key, action, callback) {
  const location = alias[key] || key
  const status = actions[action] || action

  request.post({
    url: `${URI}/op/${location}`,
    form: { status }
  }, (err, response, body) => {
      if (!body || err) {
        return res.send('동작에 문제가 있습니다.')
      }
      let result = JSON.parse(body)
      if (callback) {
        callback.apply(res, [result])
      }
  })
}

module.exports = function (robot) {
  robot.hear(/(.*) (조명|불|등)(.*)(켜|꺼|끄)/i, (res) => {
    const key = res.match[1]
    const target = res.match[2]
    const action = res.match[4]
    operate(res, key, action, (result) => {
      if (result.okay) {
        res.send(`${key} ${target}이 ${action}졌습니다.`)
      }
    })
  })

  robot.hear(/자러(.*)(가|간)/i, (res) => {
    operate(res, 'bed', 'on', (result) => {
      if (result.okay) {
        res.send(`침실 등이 켜졌습니다. ${DURATION}초 후에 거실 등이 꺼집니다.`)
        setTimeout(
          () => operate(res, 'living', 'off'),
          DURATION * 1000 // Super inaccurate time
        )
      }
    })
  })

  robot.hear(/(잔다|자라|주무세요)/i, (res) => {
    res.send(`거실 소등 합니다. ${DURATION}초 후에 침실 등이 꺼집니다. 주무세요~`)
    operate(res, 'living', 'off')
    setTimeout(
      () => operate(res, 'bed', 'off'),
      DURATION * 1000 // Super inaccurate time
    )
  })
}
