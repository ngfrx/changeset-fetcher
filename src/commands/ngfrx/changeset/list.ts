import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import axios from 'axios';
import { execSync } from 'child_process';
import { JSDOM } from 'jsdom';
import { URL } from 'url';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@ngfrx/changesetfetcher', 'org');

interface ChangeSet {
  id: string;
  name: string;
  description?: string;
  status: string;
  modifiedBy: string;
  modifiedDate: string;
}

interface ChangeSetResponse {
  recordCount: number;
  records: ChangeSet[];
}

interface AuthDetails {
  orgId: string;
  url: string;
  username: string;
}

export default class ChangsetListCommand extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');
  private static readonly CHANGESETPATH = '/changemgmt/listOutboundChangeSet.apexp';
  private static readonly ELEMENTID = 'ListOutboundChangeSetPage:listOutboundChangeSetPageBody:listOutboundChangeSetPageBody:ListOutboundChangeSetForm:ListOutboundChangeSetPageBlock:ListOutboundChangeSetBlockSection:OutboundChangeSetList:tb';

  public static examples = [
  `sfdx ngfrx:changeset:list --username mysandboxusername@example.com
    NAME                                        STATUS
    ──────────────────────────────────────────  ──────
    JIRA-1234_HELLO_WORLD_SPRINT3               Open
  `,
  `sfdx ngfrx:changeset:list --username mysandboxusername@example.com --verbose
  ID               NAME                                        DESCRIPTION  STATUS  MODIFIED BY     MODIFIED DATE
  ───────────────  ──────────────────────────────────────────  ───────────  ──────  ──────────────  ───────────────
  0A20E0000009BJA  JIRA-1234_HELLO_WORLD_SPRINT3                            Open    Olivia White    22-1-2020 17:02
  `,
  `sfdx ngfrx:changeset:list --username mysandboxusername@example.com --list
  {
    "status": 0,
    "result": {
      "recordCount": 1,
      "records": [
        {
          "id": "0A20E0000009BJA",
          "name": "JIRA-1234_HELLO_WORLD_SPRINT3",
          "description": "",
          "status": "Open",
          "modifiedBy": "Olivia White",
          "modifiedDate": "22-1-2020 17:02"
        }
      ]
    }
  }
  `];

  protected static flagsConfig = {
    verbose: flags.builtin()
  };

  protected static requiresUsername = true;
  
  // tslint:disable-next-line: no-any
  public async run(): Promise<any> {
    // Start Spinner
    if (!this.flags.json) this.ux.cli.action.start('running...');

    // process Changeset Logic
    const result = await this.processListCommand();

    if (this.flags.verbose) {
      this.ux.table(result.records, ['id', 'name', 'description', 'status', 'modifiedBy', 'modifiedDate']);
    } else {
      this.ux.table(result.records, ['name', 'status']);
    }

    // Stop Spinner
    if (!this.flags.json) this.ux.cli.action.stop();

    // Return an object to be displayed with --json
    return result;
  }

  private async processListCommand(): Promise<ChangeSetResponse> {
    // Get Connection Details
    const connDet = this.getUrlWithSessionId(this.org.getUsername());
    // Create Base URL instance for parsing
    const baseUrl = new URL(connDet.url);
    // Create Actual url
    const url =  baseUrl.protocol + '//' + baseUrl.hostname + ChangsetListCommand.CHANGESETPATH;

    // call
    const response = await this.getChangeSetDataCallout(url, baseUrl.searchParams.get('sid'));
    // parse the response

    return this.parseResponse(response);
  }

  // tslint:disable-next-line: no-any
  private parseResponse(res: any): ChangeSetResponse {
    const respArr = [];
    // Create dom
    const dom = new JSDOM(res.data);
    const domElement = dom.window.document.getElementById(ChangsetListCommand.ELEMENTID);

    if (!domElement) throw new SfdxError(messages.getMessage('errorDOMParseException'), 'DOMPARSERERROR');

    [...domElement.childNodes].forEach(element => {
      const node: ChangeSet = {
        id: element.childNodes[1].firstElementChild.href.split('id=')[1],
        name: element.childNodes[1].firstElementChild.innerHTML.trim(),
        description: this.flags.json ? element.childNodes[2].innerHTML : String(element.childNodes[2].innerHTML).substr(0, 80),
        status: element.childNodes[3].innerHTML,
        modifiedBy: element.childNodes[4].firstElementChild.innerHTML.trim(),
        modifiedDate: element.childNodes[5].innerHTML
      };

      respArr.push(node);
    });

    return {
      recordCount: respArr.length,
      records: respArr
    };
  }

  private getUrlWithSessionId(username: string): AuthDetails {
    const res = JSON.parse(execSync('sfdx force:org:open --urlonly --json -u ' + username).toString());
    if (res.status === 1) throw new SfdxError(res.message, res.name);

    return {
        orgId: res.result.orgId,
        url: res.result.url,
        username: res.result.username
    };
}

private async getChangeSetDataCallout(url: string, cookie: string) {
    return axios({ method: 'post', url, headers: {Cookie: 'sid=' + cookie}});
}
}
