import React, { useCallback } from 'react';
import { Form } from 'informed';
import { bool, func, shape, string } from 'prop-types';

import Button from '../Button';
import Label from './label';
import Select from '../Select';

import { mergeClasses } from '../../classify';
import defaultClasses from './shippingForm.css';
import { useCheckoutContext } from '@magento/peregrine/lib/state/Checkout';

const ShippingForm = props => {
    const [
        { availableShippingMethods, shippingMethod },
        checkoutApi
    ] = useCheckoutContext();
    const { cancel, submit, submitting } = props;

    const classes = mergeClasses(defaultClasses, props.classes);

    const initialValue =
        shippingMethod.carrier_code || availableShippingMethods[0].carrier_code;
    const selectableShippingMethods = availableShippingMethods.map(
        ({ carrier_code, carrier_title }) => ({
            label: carrier_title,
            value: carrier_code
        })
    );

    const handleSubmit = useCallback(
        ({ shippingMethod }) => {
            const selectedShippingMethod = availableShippingMethods.find(
                ({ carrier_code }) => carrier_code === shippingMethod
            );

            if (!selectedShippingMethod) {
                console.warn(
                    `Could not find the selected shipping method ${selectedShippingMethod} in the list of available shipping methods.`
                );
                cancel();
                return;
            }
            checkoutApi.setShippingMethod(selectedShippingMethod);
            submit();
        },
        [availableShippingMethods, checkoutApi, cancel, submit]
    );

    return (
        <Form className={classes.root} onSubmit={handleSubmit}>
            <div className={classes.body}>
                <h2 className={classes.heading}>Shipping Information</h2>
                <div
                    className={classes.shippingMethod}
                    id={classes.shippingMethod}
                >
                    <Label htmlFor={classes.shippingMethod}>
                        Shipping Method
                    </Label>
                    <Select
                        field="shippingMethod"
                        initialValue={initialValue}
                        items={selectableShippingMethods}
                    />
                </div>
            </div>
            <div className={classes.footer}>
                <Button className={classes.button} onClick={cancel}>
                    Cancel
                </Button>
                <Button
                    className={classes.button}
                    priority="high"
                    type="submit"
                    disabled={submitting}
                >
                    Use Method
                </Button>
            </div>
        </Form>
    );
};

ShippingForm.propTypes = {
    cancel: func.isRequired,
    classes: shape({
        body: string,
        button: string,
        footer: string,
        heading: string,
        shippingMethod: string
    }),
    submit: func.isRequired,
    submitting: bool
};

export default ShippingForm;
