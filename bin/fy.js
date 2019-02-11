#!/usr/bin/env node
const chalk = require('chalk')
const ora = require('ora')
const translate = require('./utils.js')


const [ text ] = process.argv.slice(2)

let spinner = ora(`Translating...“${chalk.magenta(text)}”`).start();

translate(text).then(jsn => {
	spinner.succeed()
	const [ res, relate ] = jsn
	console.log(chalk.gray('\n------------------------------------------------\n'))
	console.log(chalk.bold.green(`${res[0][0]}`));
	console.log(chalk.gray('\n------------------------------------------------\n'))
	if (relate && Array.isArray(relate)) {
		relate.forEach(item => {
			const [ category, , list] = item
			console.log(chalk.bold.yellow(`${category}`));
			list.forEach(_item =>  {
				const [ name, text ] = _item
				console.log(chalk.cyan(`- ${name} [${text.join(',')}]`))
			});
			console.log('\n')
		})
	}
	// 例句
	if (jsn[13]) {
		const egs = jsn[13][0]
		console.log(chalk.bold.yellow(`“${res[0][0]}” 例句`));
		egs.slice(0, 3).forEach(_item => {
			const [ eg ] = _item
			console.log('eg:', chalk.underline.whiteBright(`${eg.replace(/\<b\>((\w)*)\<\/b\>/, `${chalk.bold.bgMagenta('$1')}`)}`))
		});
		console.log('\n')
	}
})