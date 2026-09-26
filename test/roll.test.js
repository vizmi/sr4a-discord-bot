const { test, describe, mock } = require('node:test');
const assert = require('node:assert/strict');
const { roll_die, roll, respond } = require('../commands/rolling/roll');

describe('roll_die', () => {
	test('without the rule of six returns exactly one die', () => {
		mock.method(Math, 'random', () => 0.5); // -> 4
		const rolls = roll_die(false);
		assert.deepEqual(rolls, [4]);
		mock.reset();
	});

	test('with the rule of six, keeps rolling on a 6 and stops on a non-6', () => {
		let calls = 0;
		const sequence = [0.9333, 0.9333, 0.4]; // -> 6, 6, 3
		mock.method(Math, 'random', () => sequence[calls++]);
		const rolls = roll_die(true);
		assert.deepEqual(rolls, [6, 6, 3]);
		mock.reset();
	});
});

describe('roll', () => {
	test('rolls exactly one die per pool member without the rule of six', () => {
		const rolls = roll(5, false);
		assert.equal(rolls.length, 5);
	});

	test('returns no dice for an empty pool', () => {
		assert.deepEqual(roll(0, false), []);
	});
});

describe('respond', () => {
	test('counts hits (5s and 6s) when not glitching', () => {
		const resp = respond(4, [6, 5, 3, 2], 'en');
		assert.equal(resp, '[6] [5] [3] [2] = 2 hit(s)');
	});

	test('reports a glitch when more than half the pool are 1s but there are still hits', () => {
		const resp = respond(4, [1, 1, 1, 5], 'en');
		assert.equal(resp, '[1] [1] [1] [5] = 1 hit(s) with glitch');
	});

	test('reports a critical glitch when more than half the pool are 1s and there are no hits', () => {
		const resp = respond(4, [1, 1, 1, 2], 'en');
		assert.equal(resp, '[1] [1] [1] [2] = critical glitch');
	});

	test('localizes the response text', () => {
		const resp = respond(4, [1, 1, 1, 2], 'hu');
		assert.equal(resp, '[1] [1] [1] [2] = kritikus hiba');
	});

	test('falls back to English for an unsupported locale', () => {
		const resp = respond(4, [1, 1, 1, 2], 'de');
		assert.equal(resp, '[1] [1] [1] [2] = critical glitch');
	});
});
