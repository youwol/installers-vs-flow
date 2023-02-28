import { applications, contextMenuActions } from './installer'
import { Installer } from '@youwol/os-core'

export async function install(installer: Installer): Promise<Installer> {
    return installer.with({
        fromManifests: [
            {
                id: '@youwol/installers-vs-flow.basics',
                contextMenuActions,
                applications,
                applicationsData: {},
            },
        ],
    })
}
