/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import Sinon from 'sinon';
import { HE4SInput } from '../../components/inputs';
import { TestUtils } from '../test-utils';
import { findAllByElementType, renderComponent } from './renderComponent';

// TODO[epic=SES-2418] migrate to Storybook
describe('HE4SInput', () => {
  beforeEach(() => {
    TestUtils.stubSVGElement();
    TestUtils.stubWindowLog();
  });

  afterEach(() => {
    Sinon.restore();
  });

  it('should render an input', async () => {
    const result = renderComponent(<HE4SInput type="text" />);
    const inputElements = findAllByElementType(result, 'input');
    expect(inputElements.length, 'should have an input element').to.equal(1);
    result.unmount();
  });
});
