import { mount } from '@vue/test-utils';
import MinimalTest from './MinimalTest.vue';
import VueTest from 'vue';

describe('Minimal Test', () => {
  test('mounts a minimal component', () => {
    console.log('Vue version in minimal.spec.js:', VueTest.version);
    const wrapper = mount(MinimalTest);
    expect(wrapper.text()).toContain('Minimal Test');
  });
});
