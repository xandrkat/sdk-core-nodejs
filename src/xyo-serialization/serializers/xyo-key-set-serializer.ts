/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Thursday, 13th September 2018 3:28:11 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-key-set-serializer.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 12:11:40 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoArrayUnpacker } from '../xyo-array-unpacker';
import { XyoSerializer } from '../xyo-serializer';
import { XyoKeySet } from '../../xyo-signing/xyo-key-set';
import { XyoPacker } from '../xyo-packer';
import { XyoPublicKey } from '../../@types/xyo-signing';

export class XyoKeySetSerializer extends XyoSerializer<XyoKeySet> {

  get description () {
    return {
      major: XyoKeySet.major,
      minor: XyoKeySet.minor,
      sizeOfBytesToGetSize: 2,
      sizeIdentifierSize: 2
    };
  }

  public deserialize(buffer: Buffer, xyoPacker: XyoPacker) {
    const unpackedArray = new XyoArrayUnpacker(xyoPacker, buffer, false, 2);
    return new XyoKeySet(unpackedArray.array as XyoPublicKey[]);
  }

  public serialize(xyoKeySet: XyoKeySet, xyoPacker: XyoPacker) {
    return Buffer.concat(xyoKeySet.array.map(element =>
      xyoPacker.serialize(element, true))
    );
  }
}