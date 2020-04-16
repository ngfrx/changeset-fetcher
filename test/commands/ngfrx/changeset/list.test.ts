import { expect, test } from '@salesforce/command/lib/test';
import sinon from 'sinon';
import ChangsetListCommand from '../../../../src/commands/ngfrx/changeset/list';
import {htmlresponse, sessionToken} from './response-data-mock';

let getChangeSetCallout;
let getSessionTokenDet;

describe('ChangeSetTest', () => {
    before(() => {
    // @ts-ignore
    getChangeSetCallout = sinon.stub(ChangsetListCommand.prototype, 'getChangeSetDataCallout').returns(Promise.resolve({status: 200, data: htmlresponse}));
    // @ts-ignore
    getSessionTokenDet = sinon.stub(ChangsetListCommand.prototype, 'getUrlWithSessionId').returns(sessionToken);
    });

    after(() => {
        getChangeSetCallout.restore();
        getSessionTokenDet.restore();
    })
;
    describe('When list Changeset call is made without verbose and json flag', () => {
        test
        .stdout()
        .command(['ngfrx:changeset:list', '-u', 'test@org.com'])
        .it('should return changesetname and status', ctx => {
            expect(ctx.stdout).to.contain('NAME');
        });
    });

    describe('When list Changeset call is made with verbose and without json flag', () => {
        test
        .stdout()
        .command(['ngfrx:changeset:list', '-u', 'test@org.com', '--verbose'])
        .it('should return changeset ID', ctx => {
            expect(ctx.stdout).to.contain('ID');
        });
    });

    describe('When list Changeset call is made with json flag', () => {
        test
        .stdout()
        .command(['ngfrx:changeset:list', '-u', 'test@org.com', '--json'])
        .it('should return an Object', ctx => {
            expect(ctx.stdout).to.match(/^{/);
        });
    });
});
