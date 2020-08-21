import React from "react"
import Selector from './selector'

export default {
    title: 'Selector'
}

export const MultiSelect = () => <Selector
                                    items={[{label: 'DEMON 01', value: 'DMN01'}, {label: 'SATAN 02', value: 'STN02'}]}
                                    searchKeys={['label']}
                                    resultKey={'label'}
                                />