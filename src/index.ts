// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {create} from './create';

export const {
  StoreContext,
  useBoundActionCreators,
  useDispatch,
  useMappedState,
} = create<any, any, any>();

export {create};
