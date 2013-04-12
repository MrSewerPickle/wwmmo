package au.com.codeka.warworlds.server;

import javax.servlet.http.HttpServletResponse;

import au.com.codeka.warworlds.model.protobuf.Messages;

/**
 * This exception is thrown when you want to pass an error back to the client.
 */
public class RequestException extends Exception {
    private int mHttpErrorCode;
    private Messages.GenericError mGenericError;

    public RequestException(int httpErrorCode) {
        super(String.format("HTTP Error: %d", httpErrorCode));
        mHttpErrorCode = httpErrorCode;
    }

    public RequestException(int httpErrorCode, Messages.GenericError.ErrorCode errorCode, String errorMsg) {
        super(errorMsg);

        mHttpErrorCode = httpErrorCode;
        mGenericError = Messages.GenericError.newBuilder()
                                .setErrorCode(errorCode.getNumber())
                                .setErrorMessage(errorMsg)
                                .build();
    }

    public void populate(HttpServletResponse response) {
        response.setStatus(mHttpErrorCode);
    }

    public Messages.GenericError getGenericError() {
        return mGenericError;
    }
}
