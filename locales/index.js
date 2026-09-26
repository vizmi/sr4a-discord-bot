const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_LOCALE = 'en';

const locales = {};
for (const file of fs.readdirSync(__dirname).filter(f => f.endsWith('.json'))) {
	locales[path.basename(file, '.json')] = require(path.join(__dirname, file));
}

// Falls back to DEFAULT_LOCALE if the requested locale or key is missing.
const t = (key, locale) => (locales[locale] && locales[locale][key]) || locales[DEFAULT_LOCALE][key];

module.exports = { t };
