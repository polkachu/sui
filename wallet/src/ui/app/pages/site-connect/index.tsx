import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import Loading from '_components/loading';
import { useAppDispatch, useAppSelector, useInitializedGuard } from '_hooks';
import {
    permissionsSelectors,
    respondToPermissionRequest,
} from '_redux/slices/permissions';

import type { RootState } from '_redux/RootReducer';

import st from './SiteConnectPage.module.scss';

function SiteConnectPage() {
    const { requestID } = useParams();
    const guardLoading = useInitializedGuard(true);
    const permissionsInitialized = useAppSelector(
        ({ permissions }) => permissions.initialized
    );
    const loading = guardLoading || !permissionsInitialized;
    const permissionSelector = useMemo(
        () => (state: RootState) =>
            requestID
                ? permissionsSelectors.selectById(state, requestID)
                : null,
        [requestID]
    );
    const dispatch = useAppDispatch();
    const permissionRequest = useAppSelector(permissionSelector);
    const activeAccount = useAppSelector(({ account }) => account.address);
    const handleOnAccept = useCallback(() => {
        if (requestID && activeAccount) {
            dispatch(
                respondToPermissionRequest({
                    id: requestID,
                    accounts: [activeAccount],
                    allowed: true,
                })
            );
        }
    }, [dispatch, requestID, activeAccount]);
    useEffect(() => {
        if (
            !loading &&
            (!permissionRequest || permissionRequest.responseDate)
        ) {
            window.close();
        }
    }, [loading, permissionRequest]);

    return (
        <Loading loading={loading}>
            {permissionRequest ? (
                <>
                    <div className={st.container}>
                        <pre>{JSON.stringify(permissionRequest, null, 2)}</pre>
                    </div>
                    <div>
                        <button type="button" onClick={handleOnAccept}>
                            Accept
                        </button>
                        <button type="button">Reject</button>
                    </div>
                </>
            ) : null}
        </Loading>
    );
}

export default SiteConnectPage;
