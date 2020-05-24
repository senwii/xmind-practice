import React, { useState, useContext } from 'react'
import { Button, ButtonGroup } from '@material-ui/core'
import { Link } from 'react-router-dom'

import AppContext from '../../libs/context'

import './style.less'

export default function RouteTab() {
    const [tabs] = useState([
        { to: '/byRecord', mode: 'byRecord', desc: '按记录' },
        { to: '/byCategory', mode: 'byCategory', desc: '按类型' },
    ])
    const [appState] = useContext(AppContext)
    const { mode } = appState

    return (
        <ButtonGroup className="route-tab-root" size="small" color="primary">
            {
                tabs.map((tabitem, index) => {
                    const { to, mode: currentMode, desc } = tabitem

                    return (
                        <Button className={mode === currentMode ? 'active' : ''} key={index}>
                            <Link to={to} className="link">{ desc }</Link>
                        </Button>
                    )
                })
            }
        </ButtonGroup>
    )
}
