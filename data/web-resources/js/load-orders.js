import { userMutations } from "./graphQLMutations/userMutations.js";
import { utilities } from "./graphQLMutations/utility.js";

const formatDateLocale = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    });
};

export const loadMyOrders = async () => {
    const activeToken = utilities.getActiveUserFromSS() ? utilities.getTokenFromSS : null;

    if (activeToken != null) {
        let orders = await userMutations.getCustomerOrders(activeToken);
        let isError = false;

        if (orders.errors) {
            isError = true;
            console.log(orders.errors);
            if (orders.errors[0].extensions?.category == 'graphql-authorization') {
                await userMutations.regenerateUserToken();
                orders = await userMutations.getCustomerOrders(utilities.getTokenFromSS());
                isError = false;
            }
        }
        
        if (!isError) {
            document.querySelector('.my-orders-content').classList.remove('hidden');
            document.querySelector('.log-out-user').classList.add('hidden');

            const itemListEmptyElement = document.querySelector('.order-list-empty');
            const itemListElement = document.querySelector('.order-list-with-items');
            
            if (orders.items.length > 0) {
                const tableBody = itemListElement?.querySelector('tbody');
                const temporalTableBody = document.createElement('tbody');

                if (tableBody) {
                    orders.items.forEach((order) => {
                        const tr = document.createElement('tr');
                        tr.classList.add(
                            'border-b',
                            'transition-colors',
                            'hover:bg-muted/50',
                            'data-[state=selected]:bg-muted',
                        );

                        const orderIDTd = document.createElement('td');
                        orderIDTd.classList.add(
                            'h-12',
                            'px-4',
                            'text-left',
                            'align-middle',
                            'font-medium',
                            '[&:has([role=checkbox])]:pr-0',
                        );
                        orderIDTd.textContent = order.order_number;
                        tr.appendChild(orderIDTd);

                        const dateTd = document.createElement('td');
                        dateTd.classList.add(
                            'h-12',
                            'px-4',
                            'text-left',
                            'align-middle',
                            'font-medium',
                            '[&:has([role=checkbox])]:pr-0',
                        );
                        dateTd.textContent = formatDateLocale(order.created_at);
                        tr.appendChild(dateTd);

                        const itemsTd = document.createElement('td');
                        itemsTd.classList.add(
                            'h-12',
                            'p-4',
                            'text-left',
                            'align-middle',
                            'font-medium',
                            '[&:has([role=checkbox])]:pr-0',
                        );
                        const itemsContainerDiv = document.createElement('div');
                        itemsContainerDiv.classList.add('space-y-2');
                        order.items.forEach((item) => {
                            const itemDiv = document.createElement('div');

                            itemDiv.classList.add('text-sm');
                            itemDiv.textContent = `${item.quantity_ordered}x ${item.product_name}`;
                            itemsContainerDiv.append(itemDiv);
                        });
                        itemsTd.append(itemsContainerDiv);
                        tr.appendChild(itemsTd);

                        const totalTd = document.createElement('td');
                        totalTd.classList.add(
                            'h-12',
                            'px-4',
                            'text-left',
                            'align-middle',
                            'font-medium',
                            '[&:has([role=checkbox])]:pr-0',
                        );
                        totalTd.innerText = `$${order.grand_total}`;
                        tr.appendChild(totalTd);

                        const statueTd = document.createElement('td');
                        statueTd.classList.add(
                            'h-12',
                            'px-4',
                            'text-left',
                            'align-middle',
                            'font-medium',
                            '[&:has([role=checkbox])]:pr-0',
                        );
                        statueTd.textContent = order.status;
                        tr.append(statueTd);

                        temporalTableBody.append(tr);
                    });
                    tableBody.innerHTML = temporalTableBody?.innerHTML;
                    itemListElement?.classList.remove('hidden');
                    itemListEmptyElement?.classList.add('hidden');
                }
            } else {
                document.querySelector('.log-out-user').classList.add('hidden');
                itemListEmptyElement?.classList.remove('hidden');
                itemListElement?.classList.add('hidden');
            }
        }
    } else {
        updateOnLogOut();
    }
};

export const updateOnLogOut = async () => {
    document.querySelector('.my-orders-content').classList.add('hidden');
    document.querySelector('.log-out-user').classList.remove('hidden');
}

loadMyOrders();