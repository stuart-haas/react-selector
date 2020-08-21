import React from "react"
import Selector from './selector'
import mock from '../mock.json'

export default {
    title: 'Selector'
}

export const MultiSelect = () => <Selector
                                    items={mock}
                                    display={'full_name'}
                                    keys={['full_name', 'first_name', 'last_name']}
                                    merge={{'name': 'full_name', 'fields': ['first_name', 'last_name'], 'join': ' '}}
                                />