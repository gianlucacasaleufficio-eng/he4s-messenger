import { expect } from 'chai';

import { LegacyGroupInfo } from 'libhe4s_util_nodejs';
import { describe } from 'mocha';
import Sinon from 'sinon';
import { ConversationModel } from '../../../../models/conversation';
import { ConversationAttributes } from '../../../../models/conversationAttributes';
import { GetNetworkTime } from '../../../../he4s/apis/snode_api/getNetworkTime';
import { getConversationController } from '../../../../he4s/conversations';
import { UserUtils } from '../../../../he4s/utils';
import { HE4SUtilUserGroups } from '../../../../he4s/utils/libhe4s/libhe4s_utils_user_groups';
import { TestUtils } from '../../../test-utils';
import { generateFakeECKeyPair, stubWindowLog } from '../../../test-utils/utils';
import { CONVERSATION_PRIORITIES, ConversationTypeEnum } from '../../../../models/types';

describe('libhe4s_user_groups', () => {
  stubWindowLog();

  const getLatestTimestampOffset = 200000;
  const ourNumber = '051234567890acbdef';
  const groupECKeyPair = generateFakeECKeyPair();
  const communityUrl = 'http://example.org/roomId1234';
  const validArgs = {
    type: ConversationTypeEnum.GROUP,
    active_at: 1234,
  } as ConversationAttributes;

  beforeEach(() => {
    Sinon.stub(GetNetworkTime, 'getLatestTimestampOffset').returns(getLatestTimestampOffset);
    Sinon.stub(UserUtils, 'getOurPubKeyStrFromCache').returns(ourNumber);
    TestUtils.stubLibHE4SWorker(undefined);
  });

  afterEach(() => {
    Sinon.restore();
  });

  describe('isUserGroupToStoreInWrapper', () => {
    describe('communities', () => {
      const communityArgs = {
        id: communityUrl,
      };
      it('includes public group/community', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({ ...validArgs, ...communityArgs })
          )
        ).to.be.eq(true);
      });

      it('excludes public group/community inactive', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({ ...validArgs, ...communityArgs, active_at: undefined } as any)
          )
        ).to.be.eq(false);
      });
    });

    describe('legacy closed groups', () => {
      const validLegacyGroupArgs = {
        ...validArgs,
        type: ConversationTypeEnum.GROUP,
        id: '05123456564',
      } as ConversationAttributes;

      it('includes legacy group', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({
              ...validLegacyGroupArgs,
            })
          )
        ).to.be.eq(true);
      });

      it('exclude legacy group left', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({
              ...validLegacyGroupArgs,
              left: true,
            })
          )
        ).to.be.eq(false);
      });
      it('exclude legacy group kicked', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({
              ...validLegacyGroupArgs,
              isKickedFromGroup: true,
            })
          )
        ).to.be.eq(false);
      });

      it('exclude legacy group not active', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({
              ...validLegacyGroupArgs,
              active_at: undefined,
            } as any)
          )
        ).to.be.eq(false);
      });

      it('include hidden legacy group', () => {
        expect(
          HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
            new ConversationModel({
              ...validLegacyGroupArgs,
              priority: CONVERSATION_PRIORITIES.hidden,
            })
          )
        ).to.be.eq(true);
      });
    });

    it('excludes closed group v3 (for now)', () => {
      expect(
        HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
          new ConversationModel({
            ...validArgs,
            type: ConversationTypeEnum.GROUPV3,
            id: '03123456564',
          })
        )
      ).to.be.eq(false);
    });

    it('excludes empty id', () => {
      expect(
        HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
          new ConversationModel({
            ...validArgs,
            id: '',
          })
        )
      ).to.be.eq(false);

      expect(
        HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
          new ConversationModel({
            ...validArgs,
            id: '9871',
          })
        )
      ).to.be.eq(false);
    });

    it('excludes private', () => {
      expect(
        HE4SUtilUserGroups.isUserGroupToStoreInWrapper(
          new ConversationModel({
            ...validArgs,
            id: '0511111',
            type: ConversationTypeEnum.PRIVATE,
          })
        )
      ).to.be.eq(false);
    });
  });

  describe('LegacyGroups', () => {
    describe('insertGroupsFromDBIntoWrapperAndRefresh', () => {
      const groupArgs = {
        id: groupECKeyPair.publicKeyData.toString(),
        displayNameInProfile: 'Test Group',
        expirationMode: 'off',
        expireTimer: 0,
        members: [groupECKeyPair.publicKeyData.toString()],
      } as ConversationAttributes;

      it('returns wrapper values that match with the inputted group', async () => {
        const group = new ConversationModel({
          ...validArgs,
          ...groupArgs,
        });
        Sinon.stub(getConversationController(), 'get').returns(group);
        Sinon.stub(HE4SUtilUserGroups, 'isUserGroupToStoreInWrapper').returns(true);
        TestUtils.stubData('getLatestClosedGroupEncryptionKeyPair').resolves(
          groupECKeyPair.toHexKeyPair()
        );

        let wrapperGroup = await HE4SUtilUserGroups.insertGroupsFromDBIntoWrapperAndRefresh(
          group.get('id')
        );

        expect(wrapperGroup, 'something should be returned from the wrapper').to.not.be.null;
        if (!wrapperGroup) {
          throw Error('something should be returned from the wrapper');
        }

        wrapperGroup = wrapperGroup as LegacyGroupInfo;

        expect(
          wrapperGroup.pubkeyHex,
          'pubkeyHex in the wrapper should match the inputted group'
        ).to.equal(group.id);
        expect(wrapperGroup.name, 'name in the wrapper should match the inputted group').to.equal(
          group.get('displayNameInProfile')
        );
        expect(
          wrapperGroup.priority,
          'priority in the wrapper should match the inputted group'
        ).to.equal(group.get('priority'));
        expect(wrapperGroup.members, 'members should not be empty').to.not.be.empty;
        expect(
          wrapperGroup.members[0].pubkeyHex,
          'the member pubkey in the wrapper should match the inputted group member'
        ).to.equal(group.get('members')[0]);
        expect(
          wrapperGroup.disappearingTimerSeconds,
          'disappearingTimerSeconds in the wrapper should match the inputted group'
        ).to.equal(group.getExpireTimer());
        expect(
          wrapperGroup.encPubkey.toString(),
          'encPubkey in the wrapper should match the inputted group'
        ).to.equal(groupECKeyPair.publicKeyData.toString());
        expect(
          wrapperGroup.encSeckey.toString(),
          'encSeckey in the wrapper should match the inputted group'
        ).to.equal(groupECKeyPair.privateKeyData.toString());
        expect(
          wrapperGroup.joinedAtSeconds,
          'joinedAtSeconds in the wrapper should match the inputted group'
        ).to.equal(group.get('lastJoinedTimestamp'));
      });
      it('if disappearing messages is on then the wrapper returned values should match the inputted group', async () => {
        const group = new ConversationModel({
          ...validArgs,
          ...groupArgs,
          expirationMode: 'deleteAfterSend',
          expireTimer: 300,
        });
        Sinon.stub(getConversationController(), 'get').returns(group);
        Sinon.stub(HE4SUtilUserGroups, 'isUserGroupToStoreInWrapper').returns(true);
        TestUtils.stubData('getLatestClosedGroupEncryptionKeyPair').resolves(
          groupECKeyPair.toHexKeyPair()
        );

        let wrapperGroup = await HE4SUtilUserGroups.insertGroupsFromDBIntoWrapperAndRefresh(
          group.get('id')
        );

        expect(wrapperGroup, 'something should be returned from the wrapper').to.not.be.null;
        if (!wrapperGroup) {
          throw Error('something should be returned from the wrapper');
        }

        wrapperGroup = wrapperGroup as LegacyGroupInfo;

        expect(
          wrapperGroup.disappearingTimerSeconds,
          'disappearingTimerSeconds in the wrapper should match the inputted group expireTimer'
        ).to.equal(group.getExpireTimer());
      });
    });
  });
});
