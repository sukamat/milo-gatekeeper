/* ************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2024 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
************************************************************************* */

const action = require('../actions/gatekeeper/index.js')

describe('hello', () => {
  test('main should be defined', () => {
    expect(action.main).toBeInstanceOf(Function)
  })

  test('should return default name when no name is provided', () => {
    const response = action.main({})
    expect(response).toEqual({
      statusCode: 200,
      body: {
        payload: 'Hello Milo Indexer',
        params: {}
      }
    })
  })

  test('should return custom name when name is provided', () => {
    const params = { name: 'John' }
    const response = action.main(params)
    expect(response).toEqual({
      statusCode: 200,
      body: {
        payload: 'Hello John',
        params: params
      }
    })
  })

  test('should handle empty name parameter', () => {
    const params = { name: '' }
    const response = action.main(params)
    expect(response).toEqual({
      statusCode: 200,
      body: {
        payload: 'Hello Milo Indexer',
        params: params
      }
    })
  })
})
