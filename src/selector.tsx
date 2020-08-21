import React, { RefObject, Fragment } from 'react'
import Fuse from 'fuse.js'
import { filterBy, notEquals, equals, sortAsc, sortBy, merge } from './utils/arrayUtils'
import './selector.scss'

type T = any
type O = any

interface Props {
    items: any[]
    selected?: any[]
    keys?: string[]
    fields?: string[]
    merge?: any
    display?: string
    placeholder?: string
    noResults?: string
    searchThreshold?: number
}

interface State {
    search?: string
    items: any[]
    selected: any[]
}

export default class Selector extends React.Component<Props, State> {
    fuse: Fuse<T, O> = new Fuse([], {})
    search: RefObject<HTMLInputElement> = React.createRef()

    constructor(props: any) {
        super(props)
        this.state = {
            search: '',
            items: sortBy(merge(this.props.items, this.props.merge.name, this.props.merge.fields, this.props.merge.join), this.props.display, sortAsc),
            selected: this.props.selected || []
        }
    }

    componentDidMount() {
        this.fuse = new Fuse(this.props.items, { keys: this.props.keys, threshold: this.props.searchThreshold ? this.props.searchThreshold : 0.2 })
        this.focusSearch()
    }

    handleSearch(e: any) {
        const { value } = e.target

        const { items, selected } = this.state
        const filter = filterBy(items, this.props.display, value, equals)
        const nValue = !filter.length ? value : ''

        this.setState({
            search: nValue,
            items: this.runSearch(nValue),
            selected: filter.length && !this.checkSelected(value).length ? selected.concat(filter[0]) : [...selected]
        })
    }

    handleTabKey(e: any) {
        const tab = e.keyCode == 9
        const { items, selected } = this.state

        if(tab && items.length == 1) {
            e.preventDefault()
            if(this.checkSelected(items[0][this.props.display]).length) return
            this.setState({
                search: '',
                items: this.runSearch(''),
                selected: selected.concat(items[0])
            }, () => this.focusSearch() )
        }
       
    }

    handleDeleteKey(e: any) {
        const { value } = e.target

        const del = e.keyCode == 8
        const { selected } = this.state

        if(del && !value && selected.length) {
            const selectedCopy = [...selected]
            selectedCopy.pop()
            this.setState({
                selected: selectedCopy
            }, () => this.focusSearch() )
        }
    }

    handleSelect(e: any, item: any) {
        this.setState({
            selected: e.target.checked ? this.state.selected.concat(item) : filterBy(this.state.selected, this.props.display, item[this.props.display], notEquals)
        }, () => {
            this.focusSearch()
        })
    }

    handleRemove(e: any, item: any) {
        this.setState({
            selected: filterBy(this.state.selected, this.props.display, item[this.props.display], notEquals)
        }, () => {
            this.focusSearch()
        })
    }

    //TODO: Add the ability to navigate the list with the keyboard and select an item with the enter key

    //TODO: Add the ability to add custom items

    //TODO: Add props for setting default values

    //TODO: Add option to make a single select

    //TODO: Add option to hide or show list and add button to toggle it

    checkSelected(value: string) {
        return filterBy(this.state.selected, this.props.display, value)
    }

    focusSearch() {
        this.search.current?.focus()
    }

    runSearch(value: string) {
        return value ? this.fuse.search(value) as Array<any> : this.props.items
    }

    render() {
        return (
            <div className="select">
                <div className="select-search">
                    <div className="select__selected">
                        {this.state.selected.map((item: any, index: number) => (
                            <div key={index} className="select__selected-tag">
                                <div className="select__selected-tag__label">{item[this.props.display]}</div>
                                <div className="select__selected-tag__remove" onClick={(e: any) => this.handleRemove(e, item)}></div>
                            </div>
                        ))}
                        <input
                            type="text"
                            ref={this.search}
                            placeholder={this.props.placeholder ? this.props.placeholder : 'Search...'}
                            value={this.state.search}
                            onChange={(e: any) => { this.handleSearch(e) }}
                            onKeyDown={(e: any) => {this.handleTabKey(e); this.handleDeleteKey(e);}}
                        />
                    </div>
                </div>
                <ul className="select-search__results">
                    {this.state.items.map((item: any, index: number) => (
                        <li key={index} className="select-search__results-result">
                            <input id={`item-${index}`} type="checkbox" value={item[this.props.display]} checked={filterBy(this.state.selected, this.props.display, item[this.props.display]).length} onChange={(e: any) => this.handleSelect(e, item)} />
                            <label htmlFor={`item-${index}`} className="select-search__results-result__label">{item[this.props.display]}</label>
                        </li>
                    ))}
                    {!this.state.items.length && <p className="no-results">{this.props.noResults ? this.props.noResults : 'No results for that search'}</p>}
                </ul>
            </div>
        )
    }
}