
function failSafe(err, res) {
  console.log(("##### dbFailSafe Error Start #####\n" + err + "\n##### dbFailSafe Error End #####"))
  return res.status(500).send(err)
}

module.exports = { failSafe }
