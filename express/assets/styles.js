const bodyText = `
  margin: auto;
  font-size: 12px;
  display: block;
  width: 60%;
`

const outterWrapper = `
  background-image: linear-gradient(180deg, rgba(239,101,249,1) 80%, rgba(138,56,239,1) 89%, rgba(42,14,226,1) 98%);
  border-radius: 50%;
  width: fit-content;
  margin: 2% auto;
  text-align: center;
`

const innerWrapper = `
  background-color: black;
  width: 250px;
  padding: 16px;
  border-radius: 20px;
  margin: 0 auto 4px 0;
`

// box-shadow: inset 0px 0px 34px 0px rgb(244 118 80);
const logoWrapper = `
  display: block;
  width: fit-content;
  margin: auto;
`

const logo = `
  width: 200px;
  height: 175px;
`

const text = `
  font-size: 20px;
  width: fit-content;
  margin: auto;
  color: white;
  margin-top: 10px;
`

const button = `
  display: block;
  background-image: linear-gradient(90deg, rgba(239,101,249,1) 0%, rgba(138,56,239,1) 50%, rgba(42,14,226,1) 100%);
  height: 34px;
  border: 0;
  border-radius: 20px;
  padding: 4px 16px;
  line-height: 34px;
  margin: 4px auto;
  text-decoration: none;
  color: white;
  font-family: math;
  font-size: 20px;
`

const followUs = `
  font-size: 20px;
  color: white;
  font-family: math;
`

const instagramLogoWrapper = `
  display: block;
  width: fit-content;
  margin: auto;
`

const instagramLogo = `
  width: 40px;
`

module.exports = {
  bodyText,
  outterWrapper,
  innerWrapper,
  logoWrapper,
  logo,
  text,
  button,
  followUs,
  instagramLogoWrapper,
  instagramLogo
}
