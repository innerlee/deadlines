// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StatusBarItem, window, StatusBarAlignment, workspace } from 'vscode';
import { URL } from 'url';
import https = require('https');
import ical = require('ical');
import { ListenOptions } from 'net';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "deadlines" is now active!');

	var ddls = Deadline.parse();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!');
	// });
	console.log(ddls.length);
	// context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

class Deadline {

	private _statusBarItem: StatusBarItem;
	private _name: string;
	private _ddl: Date;

	constructor(name: string, ddl: Date) {
		this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 1);
		this._name = name;
		this._ddl = ddl;

		let tooltip = [
			`= ${name} =`,
			`deadline: ${ddl}`,
		];

		// Update the status bar
		var diff = Math.floor((ddl.getTime() - Date.now()) / (1000 * 3600 * 24));
		this._statusBarItem.text = `${name} (${diff} days)`;
		this._statusBarItem.tooltip = tooltip.join('\n');
		if (this.showornot) {
			this._statusBarItem.show();
		}
	}

	static parse(): Array<Deadline> {
		var conferences = workspace.getConfiguration("deadlines").conferences;
		let ans: Array<Deadline> = [];
		ical.fromURL('https://aideadlin.es/ai-deadlines.ics', {}, function (err, data) {
			for (let k in data) {
				var c = data[k];
				if (c && c.summary && c.start) {
					var conf_full = c.summary.replace('deadline', '').trim();
					if (!conf_full.endsWith('abstract')) {
						var found = conf_full.match(/(?<conf>.*)\s+(?<year>\d+)/);
						if (found && found.groups) {
							if (conferences.includes(found.groups.conf)) {
								console.log(conf_full, c.start);
								var diff = (c.start.getTime() - Date.now()) / (1000 * 3600 * 24);
								if (diff > 0 && diff < 90) {
									ans.push(new Deadline(conf_full, c.start));
								}
							}
						}
					}
				}
			}
		});
		return ans;
	}

	get name(): string {
		return this._name;
	}

	get ddl(): Date {
		return this._ddl;
	}

	get showornot(): boolean {
		return true;
	}

	dispose() {
		this._statusBarItem.dispose();
	}
}
