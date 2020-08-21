import React from "react"
import Selector from './selector'
import mock from '../mock.json'
import { sortAsc } from "./utils/arrayUtils"

export default {
    title: 'Selector'
}

export const MultiSelect = () => <Selector
                                    items={mock}
                                    display={'full_name'}
                                    orderBy={'last_name'}
                                    sort={sortAsc}
                                    keys={['full_name', 'first_name', 'last_name']}
                                    merge={{'name': 'full_name', 'fields': ['first_name', 'last_name'], 'join': ' '}}
                                />