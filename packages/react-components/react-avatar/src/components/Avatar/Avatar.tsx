import * as React from 'react';
import { renderAvatar_unstable } from './renderAvatar';
import { useAvatar_unstable } from './useAvatar';
import { useCustomStyleHooks_unstable } from '@fluentui/react-shared-contexts';
import { useAvatarStyles_unstable } from './useAvatarStyles';
import type { AvatarProps } from './Avatar.types';
import type { ForwardRefComponent } from '@fluentui/react-utilities';

export const Avatar: ForwardRefComponent<AvatarProps> = React.forwardRef((props, ref) => {
  const state = useAvatar_unstable(props, ref);

  useAvatarStyles_unstable(state);

  const { useAvatarStyles_unstable: useCustomStyles } = useCustomStyleHooks_unstable();
  useCustomStyles(state);

  return renderAvatar_unstable(state);
});

Avatar.displayName = 'Avatar';
