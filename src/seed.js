const {
  randomBoolean,
  randomCreatedDate,
  randomEmail,
  randomTraderName,
} = require("@mui/x-data-grid-generator")
const fs = require("fs")
const path = require("path")

const data = { records: [] }

for (let i = 1; i <= 200; i++) {
  const gen = [
    { name: "#no_face", login: "#no_face", event: "Лицо не найдено" },
    { name: randomTraderName(), login: randomEmail(), event: "Успешный вход" },
  ]

  const { event, login, name } = gen[+randomBoolean()]

  data.records.push({
    id: i,
    image: "./no-image.png",
    name,
    login,
    time: randomCreatedDate(),
    event,
    temperature: true,
  })
}

fs.writeFile(
  path.resolve(__dirname, "db.json"),
  JSON.stringify(data, null, 2),
  (err) => {
    if (err) {
      console.log(err)
    }
  }
)
