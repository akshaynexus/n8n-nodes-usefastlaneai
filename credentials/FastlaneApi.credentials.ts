import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FastlaneApi implements ICredentialType {
	name = 'fastlaneApi';

	displayName = 'Fastlane AI API';

	icon: Icon = { light: 'file:../icons/fastlane.svg', dark: 'file:../icons/fastlane.dark.svg' };

	documentationUrl = 'https://github.com/akshaynexus/usefastlane-api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'fsln_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.usefastlane.ai/api/v1',
			url: '/connections',
			method: 'GET',
		},
	};
}