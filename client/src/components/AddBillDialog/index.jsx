import React, { useState, useContext } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    FormControl,
    Select,
    InputLabel,
    MenuItem,
    TextField,
    InputAdornment,
    FormHelperText,
    Button,
} from '@material-ui/core'
import { DateTimePicker } from '@material-ui/pickers'

import AppContext from '../../libs/context'

import './style.less'

export default function AddBillDialog(props) {
    const [time, setTime] = useState(Date.now())
    const [category, setCategory] = useState('')
    const [amount, setAmount] = useState('')
    const [errorObject, setErrorObject] = useState({
        time: '',
        category: '',
        amount: '',
    })
    const [appState, dispatch] = useContext(AppContext)

    const { cateList, month, categoryId } = appState

    function doTimeChange(value) {
        setTime(value)
        setErrorObject(old => ({
            ...old,
            time: '',
        }))
    }

    function doCategoryChange(evt) {
        setCategory(evt.target.value)
        setErrorObject(old => ({
            ...old,
            category: '',
        }))
    }

    function doAmountChange(evt) {
        const value = evt.target.value.trim()

        if (!/^[\d\.]*$/.test(value)) {
            return
        }
        if (isNaN(Number(value))) {
            return
        }
        if (value.length > 18) {
            return
        }

        setAmount(value)
        setErrorObject(old => ({
            ...old,
            amount: '',
        }))
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            className="add-bill-dialog"
            aria-labelledby="add-dialog-title"
        >
            <DialogTitle id="add-dialog-title">创建账单</DialogTitle>
            <DialogContent>
                <FormControl>
                    <DateTimePicker
                        variant="inline"
                        required
                        error={Boolean(errorObject.time)}
                        label="账单日期"
                        value={time}
                        onChange={doTimeChange}
                    />
                    <FormHelperText>{errorObject.time}</FormHelperText>
                </FormControl>
                <FormControl required error={Boolean(errorObject.category)}>
                    <InputLabel shrink>账单类型</InputLabel>
                    <Select
                        value={category}
                        displayEmpty={true}
                        renderValue={val => val ? cateList?.[val].name : '请选择'}
                        onChange={doCategoryChange}
                    >
                    {
                        cateList?.length > 0 && cateList.map((cateitem, index) => (
                            <MenuItem value={index} key={cateitem.id}>{cateitem.name}</MenuItem>
                        ))
                    }
                    </Select>
                    <FormHelperText>{errorObject.category}</FormHelperText>
                </FormControl>
                <FormControl>
                    <TextField
                        label="金额"
                        placeholder="请输入"
                        type="text"
                        required
                        error={Boolean(errorObject.amount)}
                        value={amount}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                        }}
                        onChange={doAmountChange}
                    />
                    <FormHelperText>{errorObject.amount}</FormHelperText>
                </FormControl>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={() => {
                        if (!time || !category || !amount) {
                            setErrorObject(old => ({
                                ...old,
                                time: !time ? '请选择账单日期' : '',
                                category: !category ? '请选择账单类型' : '',
                                amount: !amount ? '请输入账单金额' : '',
                            }))
                            return
                        }
                        dispatch({
                            type: 'addBill',
                            params: {
                                dispatch,
                                time: new Date(time).getTime(),
                                category: cateList[category]?.id,
                                amount,
                                month,
                                categoryId,
                            }
                        })
                        props.onClose()
                    }}>创建</Button>
                    <Button variant="outlined" color="primary" onClick={props.onClose}>取消</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}
