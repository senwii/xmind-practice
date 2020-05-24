import React, { useContext } from 'react'
import { Switch } from '@material-ui/core'

import AppContext from '../../libs/context'
import { MONTH_SVG_PATH } from '../../libs/constants'

import './style.less'

export default function SideBar() {
    const [appState, dispatch] = useContext(AppContext)
    const { month, income, expend, total, fixedSideBar } = appState

    return (
        <div className={`sidebar-root ${fixedSideBar ? 'fixed' : ''}`}>
            <div className="main-content">
                <Switch size="small" checked={fixedSideBar} onChange={evt => dispatch({
                    type: 'updateState',
                    payload: {
                        fixedSideBar: evt.target.checked,
                    },
                })} />
                <svg viewBox="0 0 200 200">
                    <path id="month-path" d={MONTH_SVG_PATH[month - 1]} />
                    <text x="135" y="116" fontFamily="Verdana" fontSize="35">月</text>
                </svg>
                <div className="math-container">
                    <div className="calc-line">
                        <span className="money">{ income || '0.00' }</span>
                        <span className="suffix">(收)</span>
                    </div>
                    <div className="calc-line">
                        <span className="minus">&zwnj;</span>
                        <span className="money">{ expend || '0.00' }</span>
                        <span className="suffix">(支)</span>
                    </div>
                    <div className="separator" />
                    <div className="calc-line">
                        <span className="money">{ total || '0.00' }</span>
                        <span className="suffix">(总)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
