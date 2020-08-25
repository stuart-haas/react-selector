import React, { RefObject } from 'react'
import Fuse from 'fuse.js'
import { sortAsc, sortBy, merge, wrap } from './utils/arrayUtils'
import './react-selector.scss'

type T = any

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
    listActive: boolean
    hasFocus: boolean
    cursor: number
}

export default class Selector extends React.Component<Props, State> {
    wrapperRef: RefObject<HTMLDivElement> = React.createRef()
    inputRef: RefObject<HTMLInputElement> = React.createRef()
    fuse: Fuse<T> = new Fuse([], {})
    items: any[]

    constructor(props: any) {
        super(props)
        this.state = {
            search: '',
            items: wrap(sortBy(merge(this.props.items, this.props.merge.name, this.props.merge.fields, this.props.merge.join), this.props.orderBy ? this.props.orderBy : this.props.display, this.props.sort ? this.props.sort: sortAsc), 'item'),
            selected: this.props.selected || [],
            listActive: false,
            hasFocus: false,
            cursor: 0
        }
        this.items = this.state.items
    }

    componentDidMount() {
        this.fuse = new Fuse(this.props.items, { keys: this.props.keys, threshold: this.props.searchThreshold ? this.props.searchThreshold : 0.2 })
        document.addEventListener('mousedown', this.handleClickOutside.bind(this))
    }

    componentWillMount() {
        document.removeEventListener('mousedown', this.handleClickOutside.bind(this))
    }

    handleClickOutside(e: any) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(e.target)) {
            this.setState({
                hasFocus: false,
                listActive: false
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.cursor !== prevState.cursor) {
          this.scrollActiveItemIntoView();
        }
      }

    handleSearch(e: any) {
        var { value } = e.target

        const { items, selected } = this.state
        const filter = items.filter(a => { return a['item'][this.props.display].toLowerCase() == value.toLowerCase() })
        const check =  selected.filter(a => { return a['item'][this.props.display].toLowerCase() == value.toLowerCase() })
        const search = !filter.length ? value : ''

        this.setState({
            search,
            items: this.search(search),
            selected: filter.length && !check.length ? selected.concat(filter[0]) : [...selected]
        })
    }

    handleTab(e: any) {
        const { items, selected } = this.state
        const tab = e.keyCode == 9

        if(tab && items.length == 1) {
            e.preventDefault()

            const check =  selected.filter(a => { return a['item'][this.props.display].toLowerCase() == items[0]['item'][this.props.display].toLowerCase() })
            if(check.length) return

            this.setState({
                search: '',
                items: this.search(),
                selected: selected.concat(items[0])
            }, () => this.focus() )
        }
       
    }

    handleEnter(e: any) {
        const { items, selected, cursor } = this.state
        const enter = e.keyCode == 13

        if(enter) {
            const check =  selected.filter(a => { return a['item'][this.props.display].toLowerCase() == items[cursor]['item'][this.props.display].toLowerCase() })
            if(check.length) return

            this.setState({
                selected: selected.concat(items[cursor])
            }, () => this.focus() )
        }
    }

    handleDelete(e: any) {
        const { value } = e.target
        const del = e.keyCode == 8

        if(del && !value && this.state.selected.length) {
            var selected = [...this.state.selected]
            selected.pop()
            this.setState({
                selected
            }, () => this.focus() )
        }
    }

    handleNavigateList(e: any) {
        const { cursor, items } = this.state
        const up = e.keyCode == 38
        const down = e.keyCode == 40
        
        if(up && cursor > 0) {
            this.setState(prevState => ({
                cursor: prevState.cursor - 1
            }))
        } else if(down && cursor < items.length - 1) {
            this.setState(prevState => ({
                cursor: prevState.cursor + 1
            }))
        }
    }

    handleSelect(e: any, item: any, index: number) {
        e.stopPropagation()
        this.setState({
            cursor: index,
            selected: !this.state.selected.includes(item) ? this.state.selected.concat(item) : this.state.selected.filter(a => { return item !== a})
        }, () => this.focus() )
    }

    handleRemove(e: any, item: any) {
        this.setState({
            selected: this.state.selected.filter(a => { return item[this.props.display].toLowerCase() !== a['item'][this.props.display].toLowerCase() })
        }, () => this.focus() )
    }

    handleToggleActiveState(e: any) {
        this.focus()
    }

    search(value: string = "") {
        return value ? this.fuse.search(value) as Array<any> : [...this.items]
    }

    focus() {
        this.setState({
            hasFocus: true,
            listActive: true
        }, () => this.inputRef.current?.focus())
    }

    scrollActiveItemIntoView() {
        this.refs.activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        })
      }

    render() {
        return (
            <div ref={this.wrapperRef} className="select">
                <div className="select-search" onClick={(e: any) => { this.handleToggleActiveState(e) }}>
                    <div className="select__selected">
                        {this.state.selected.map((item: any, index: number) => (
                            <div key={index} className="select__selected-tag">
                                <div className="select__selected-tag__label">{item['item'][this.props.display]}</div>
                                <div className="select__selected-tag__remove" onClick={(e: any) => this.handleRemove(e, item['item'])}></div>
                            </div>
                        ))}
                        <input
                            type="text"
                            ref={this.inputRef}
                            placeholder={this.props.placeholder ? this.props.placeholder : 'Search...'}
                            value={this.state.search}
                            onChange={(e: any) => { this.handleSearch(e) }}
                            onKeyDown={(e: any) => {this.handleTab(e); this.handleEnter(e); this.handleDelete(e); this.handleNavigateList(e) }}
                            onFocus={(e: any) => { this.setState({ hasFocus: true })}}
                            onBlur={(e: any) => { this.setState({ hasFocus: false })}}
                        />
                    </div>
                </div>
                <ul className={((this.state.hasFocus || this.state.listActive) ? "visible " : "") + "select-search__results"}>
                    {this.state.items.map((item: any, index: number) => (
                        <li ref={this.state.cursor == index && "activeItem"} key={index} className={((this.state.selected.filter(a => { return item['item'][this.props.display].toLowerCase() == a['item'][this.props.display].toLowerCase() }).length) ? "selected " : "") + (this.state.cursor == index ? "active " : "") + "select-search__results-result"} onClick={(e: any) => this.handleSelect(e, item, index)}>
                            <label htmlFor={`item-${index}`} className="select-search__results-result__label">{item['item'][this.props.display]}</label>
                        </li>
                    ))}
                    {!this.state.items.length && <li className="select-search__results-no-results">{this.props.noResults ? this.props.noResults : 'No results for that search'}</li>}
                </ul>
            </div>
        )
    }
}