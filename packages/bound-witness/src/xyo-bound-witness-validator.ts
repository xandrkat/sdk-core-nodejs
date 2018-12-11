/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Tuesday, 20th November 2018 5:10:50 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-bound-witness-validator.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Monday, 10th December 2018 4:36:43 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoError, XyoErrors } from "@xyo-network/errors"
import { IXyoHash } from "@xyo-network/hashing"
import { IXyoBoundWitness } from "./@types"
import { IXyoSignature } from "@xyo-network/signing"
import { XyoBase } from "@xyo-network/base"
import { schema } from "@xyo-network/serialization-schema"

export class XyoBoundWitnessValidator extends XyoBase {

  constructor(
    private readonly options: {
      checkPartyLengths: boolean,
      checkIndexExists: boolean,
      checkCountOfSignaturesMatchPublicKeysCount: boolean,
      validateSignatures: boolean,
      validateHash: boolean
    }) {
    super()
  }

  public async validateBoundWitness(hash: IXyoHash, originBlock: IXyoBoundWitness): Promise<void> {
    const signaturesLength = originBlock.signatures.length
    const heuristicsLength = originBlock.heuristics.length
    const metadataLength = originBlock.metadata.length
    const keysLength = originBlock.publicKeys.length
    const signingData = originBlock.getSigningData()

    this.logInfo(`Signing data`, signingData.toString('hex'))
    if (this.options.validateHash) {
      const validates = await hash.verifyHash(signingData)
      if (!validates) {
        throw new XyoError(`Hash does not match signing data`, XyoErrors.INVALID_PARAMETERS)
      }
    }

    if (
      this.options.checkPartyLengths &&
      (
        signaturesLength < 1 ||
        signaturesLength !== heuristicsLength ||
        signaturesLength !== metadataLength ||
        signaturesLength !== keysLength
      )
    ) {
      throw new XyoError(`Party fields mismatch`, XyoErrors.INVALID_PARAMETERS)
    }

    if (this.options.checkIndexExists) {
      originBlock.heuristics.forEach((heuristics, currentIndex) => {
        const index = heuristics.find(heuristic => heuristic.schemaObjectId === schema.index.id)
        if (index === undefined) {
          throw new XyoError(
            `Each Party must have an index in their signed payload. Failed at index ${currentIndex}`,
            XyoErrors.INVALID_PARAMETERS
          )
        }
      })
    }

    await originBlock.signatures.reduce(async (promiseChain, signatureSet, outerIndex) => {
      await promiseChain
      if (
        this.options.checkCountOfSignaturesMatchPublicKeysCount &&
        signatureSet.signatures.length !== originBlock.publicKeys[outerIndex].keys.length
      ) {
        throw new XyoError(`There was a mismatch in keys and signatures length`, XyoErrors.INVALID_PARAMETERS)
      }

      if (!this.options.validateSignatures) {
        return
      }

      return signatureSet.signatures.reduce(async (innerPromiseChain, innerSignature, innerIndex) => {
        await innerPromiseChain
        const validates = await (innerSignature as IXyoSignature).verify(
          signingData,
          originBlock.publicKeys[outerIndex].keys[innerIndex]
        )

        if (!validates) {
          this.logError('Signature', innerSignature.serializeHex())
          this.logError('Public Key', originBlock.publicKeys[outerIndex].keys[innerIndex].serializeHex())
          this.logError('Signing data', signingData.toString('hex'))

          throw new XyoError(
            `Could not validate signature at index [${outerIndex}][${innerIndex}]`, XyoErrors.INVALID_PARAMETERS
          )
        }
      }, Promise.resolve() as Promise<void>)
    }, Promise.resolve() as Promise<void>)
  }
}