
function failSafe(err, res) {
  console.log(err)
  return res.status(500).send({"debugmessage":err})
}

module.exports = { failSafe }
