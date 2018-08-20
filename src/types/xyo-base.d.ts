/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Friday, 17th August 2018 9:27:28 am
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-base.d.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Friday, 17th August 2018 1:07:54 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */


export interface IXYOBase {
  getMajor(): number;
  getMinor(): number;
  getCode(): number;
  getCanonicalName(): string;
}