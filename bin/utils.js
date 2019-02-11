const http = require('http')
const pkg = require('../package.json')

let Store = {
	TKK: '430475.4134039656'
}

/**
 * 内容编码
 * @param {[type]} a [description]
 * @param {[type]} b [description]
 */
function EncodeText(a, b) {
	for (var c = 0; c < b.length - 2; c += 3) {
		var d = b.charAt(c + 2)
		d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d)
		d = '+' == b.charAt(c + 1) ? a >>> d : a << d
		a = '+' == b.charAt(c) ? (a + d) & 4294967295 : a ^ d
	}
	return a
}

/**
 * 获取google token
 * @param  {[type]} a [待翻译内容]
 */
function getToken(txt) {
	const [ codeL, codeR ] = Store['TKK'].split('.')
	for (var e = [], f = 0, g = 0; g < txt.length; g++) {
		var k = txt.charCodeAt(g)
		128 > k
			? (e[f++] = k)
			: (2048 > k
					? (e[f++] = (k >> 6) | 192)
					: (55296 == (k & 64512) &&
					  g + 1 < txt.length &&
					  56320 == (txt.charCodeAt(g + 1) & 64512)
							? ((k = 65536 + ((k & 1023) << 10) + (txt.charCodeAt(++g) & 1023)),
							  (e[f++] = (k >> 18) | 240),
							  (e[f++] = ((k >> 12) & 63) | 128))
							: (e[f++] = (k >> 12) | 224),
					  (e[f++] = ((k >> 6) & 63) | 128)),
			  (e[f++] = (k & 63) | 128))
	}
	txt = Number(codeL)
	for (f = 0; f < e.length; f++) (txt += e[f]), (txt = EncodeText(txt, '+-a^+6'))
	txt = EncodeText(txt, '+-3^+b+-f')
	txt ^= Number(codeR) || 0
	0 > txt && (txt = (txt & 2147483647) + 2147483648)
	txt %= 1e6
	return (txt.toString() + '.' + (txt ^ Number(codeL)))
}

/**
 * 语言选择
 * @param  {[type]} text [待翻译的内容]
 * @return {[type]}      [s 源code,t 目标code]
 */
function autoChoice(text) {
	if (/[\u4e00-\u9fa5]/.test(text)) {
		return {
			s: 'zh-CN',
			t: 'en'
		}
	}
	return {
		s: 'en',
		t: 'zh-CN'
	}
}

/**
 * 翻译
 * @param  {[type]} txt [待翻译名称]
 */
function translate(txt) {
	const { s = 'en', t = 'zh-CN' } = autoChoice(txt)
	let query = `sl=${s}&tl=${t}&hl=${s}&tk=${getToken(txt)}&q=${encodeURI(txt)}`
	const opts = {
		...pkg.proxy,
	  path: `http://translate.google.com/translate_a/single?client=webapp&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&otf=1&ssel=0&tsel=0&kc=7&${query}`,
	  headers: {
	    Host: 'translate.google.com',
	    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
	  }
	}
	return new Promise((resolve, reject) => {
		http.get(opts, res => {
			let body = ''
	    res.on('data', chunk => body+= chunk)
	    res.on('end', () => resolve(JSON.parse(body)))
		})
	})
}


module.exports = translate