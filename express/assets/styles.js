const outterWrapperStyles = `
  padding: 16px 8px;
  background-color: #F47650;
  border-radius: 50%;
`

const innerWrapperStyles = `
  background-color: black;
  margin: auto;
  width: 250px;
  padding: 16px;
  border-radius: 20px;
`

// box-shadow: inset 0px 0px 34px 0px rgb(244 118 80);

const logoWrapperStyles = `
  display: block;
  width: fit-content;
  margin: auto;
`

const logoStyles = `
  width: 200px;
  height: 200px;
`

const textStyles = `
  font-size: 20px;
  width: fit-content;
  margin: auto;
  text-align: center;
  color: white;
  margin-top: -20px;
`

const buttonStyles = `
  display: block;
  background-color: #F47650;
  height: 35px;
  border: 0;
  border-radius: 20px;
  padding: 4px 16px;
  font-weight: bold;
  text-align: center;
  line-height: 32px;
  margin: 4px auto;
  text-decoration: none;
  color: black;
  font-family: cursive;
  font-size: 20px;
  letter-spacing: 1px;
`

module.exports = {
  outterWrapperStyles,
  innerWrapperStyles,
  logoWrapperStyles,
  logoStyles,
  textStyles,
  buttonStyles
}