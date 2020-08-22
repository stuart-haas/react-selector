import React, { RefObject } from 'react'
import Fuse from 'fuse.js'
import { filterBy, notEquals, equals, sortAsc, sortBy, merge, wrap } from './utils/arrayUtils'
import './react-selector.scss'

type T = any
type O = any

interface Props {
    items: any[]
    selected?: any[]
    keys: string[]
    merge?: any
    display: string
    orderBy?: string
    sort?: any
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
    fuse: Fuse<T> = new Fuse([], {})
    search: RefObject<HTMLInputElement> = React.createRef()
    items: any[]

    constructor(props: any) {
        super(props)
        this.state = {
            search: '',
            items: wrap(sortBy(merge(this.props.items, this.props.merge.name, this.props.merge.fields, this.props.merge.join), this.props.orderBy ? this.props.orderBy : this.props.display, this.props.sort ? this.props.sort: sortAsc), 'item'),
            selected: this.props.selected || []
        }
        this.items = this.state.items
    }

    componentDidMount() {
        this.fuse = new Fuse(this.props.items, { keys: this.props.keys, threshold: this.props.searchThreshold ? this.props.searchThreshold : 0.2 })
        this.focusSearch()
    }

    handleSearch(e: any) {
        const { value } = e.target

        const { items, selected } = this.state
        const filter = items.filter(a => { return a['item'][this.props.display].toLowerCase() == value.toLowerCase() })
        const check =  selected.filter(a => { return a['item'][this.props.display].toLowerCase() == value.toLowerCase() })
        const nValue = !filter.length ? value : ''

        this.setState({
            search: nValue,
            items: this.runSearch(nValue),
            selected: filter.length && !check.length ? selected.concat(filter[0]) : [...selected]
        })
    }

    handleTabKey(e: any) {
        const tab = e.keyCode == 9
        const { items, selected } = this.state

        if(tab && items.length == 1) {
            e.preventDefault()

            const check =  selected.filter(a => { return a['item'][this.props.display].toLowerCase() == items[0]['item'][this.props.display].toLowerCase() })
            if(check.length) return

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

        if(del && !value && this.state.selected.length) {
            var selected = [...this.state.selected]
            selected.pop()
            this.setState({
                selected
            }, () => this.focusSearch() )
        }
    }

    handleSelect(e: any, item: any) {
        this.setState({
            selected: !this.state.selected.includes(item) ? this.state.selected.concat(item) : this.state.selected.filter(a => { return item !== a})
        }, () => this.focusSearch() )
    }

    handleRemove(e: any, item: any) {
        this.setState({
            selected: this.state.selected.filter(a => { return item[this.props.display].toLowerCase() !== a['item'][this.props.display].toLowerCase() })
        }, () => this.focusSearch() )
    }

    //TODO: Navigate the list with the keyboard and select an item with the enter key

    //TODO: Add custom items

    //TODO: Setting default values

    //TODO: Make a single select

    //TODO: Hide or show list and add button to toggle it

    //TODO: Add buttons to clear all and select all

    //TODO: Load in via ajax

    //TODO: Highlight matching text in list

    //TODO: Auto height or min/max height

    runSearch(value: string) {
        return value ? this.fuse.search(value) as Array<any> : [...this.items]
    }

    focusSearch() {
        this.search.current?.focus()
    }

    render() {
        return (
            <div className="select">
                <div className="select-search">
                    <div className="select__selected">
                        {this.state.selected.map((item: any, index: number) => (
                            <div key={index} className="select__selected-tag">
                                <div className="select__selected-tag__label">{item['item'][this.props.display]}</div>
                                <div className="select__selected-tag__remove" onClick={(e: any) => this.handleRemove(e, item['item'])}></div>
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
                        <li key={index} className={(this.state.selected.filter(a => { return item['item'][this.props.display].toLowerCase() == a['item'][this.props.display].toLowerCase() }).length ? "active " : "") + "select-search__results-result"}>
                            <label htmlFor={`item-${index}`} className="select-search__results-result__label" onClick={(e: any) => this.handleSelect(e, item)}>{item['item'][this.props.display]}</label>
                        </li>
                    ))}
                    {!this.state.items.length && <p className="no-results">{this.props.noResults ? this.props.noResults : 'No results for that search'}</p>}
                </ul>
            </div>
        )
    }
}